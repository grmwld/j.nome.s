NO_COLOR=\x1b[0m
GREEN=\x1b[32;01m
RED=\x1b[31;01m
YELLOW=\x1b[33;01m
TEST_DIR = ./test
DEMO_DIR = $(TEST_DIR)/data
DEMO_REF_FASTA = $(DEMO_DIR)/"SacCer.EF4.fasta"
DEMO_GENES_JFF = $(DEMO_DIR)/"SacCer.gene.jff"
DEMO_DB = "SacCer-demo"
DEMO_GENE_COL = "ensembl_genes"
BIN_SCRIPT = ./bin

test:
	@NODE_ENV=test 	./node_modules/.bin/mocha \
		--reporter $(REPORTER)

test-acceptance:
			@NODE_ENV=test ./node_modules/.bin/mocha \
				--reporter spec \
				test/HTMLDOCSacceptance/*.js

install-demo: $(DEMO) $(BIN_SCRIPT)
	@ echo "$(YELLOW)Installing demo data$(NO_COLOR)" \
		&& echo "Unpacking demo data ..." \
		&& tar xvf $(DEMO_DIR).tar.bz2 \
		&& echo "Loading reference ..." \
		&& $(BIN_SCRIPT)/load_fasta_reference.py \
			-i $(DEMO_REF_FASTA) \
			-d $(DEMO_DB) \
			--drop \
		&& echo "Loading annotation ..." \
		&& mongoimport \
			-d $(DEMO_DB) \
			-c $(DEMO_GENE_COL) \
			--file $(DEMO_GENES_JFF) \
			--drop \
			--stopOnError \
		&& echo "Repacking demo data ..." \
		&& tar cvjf $(DEMO_DIR).tar.bz2 $(DEMO_DIR) \
		&& rm -r $(DEMO_DIR) \
		&& echo "$(GREEN)DONE$(NO_COLOR)"

site:
	rm -fr /tmp/docs \
		  && cp -fr docs /tmp/docs \
		    && git cpheckout gh-pages \
			  && cp -fr /tmp/docs/* . \
			  && echo "done"

.PHONY: site test test-acceptance install-demo
